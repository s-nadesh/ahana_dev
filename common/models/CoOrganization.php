<?php

namespace common\models;

use Exception;
use Yii;
use yii\db\ActiveQuery;
use yii\db\Connection;

/**
 * This is the model class for table "co_organization".
 *
 * @property integer $org_id
 * @property string $org_name
 * @property string $org_description
 * @property string $org_db_host
 * @property string $org_db_username
 * @property string $org_db_password
 * @property string $org_database
 * @property string $org_domain
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoLogin[] $coLogins
 * @property CoTenant[] $coTenants
 */
class CoOrganization extends GActiveRecord {

    public $is_decoded = false;
    public $patient_UHID_prefix;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_organization';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['org_name', 'org_description', 'org_db_host', 'org_db_username', 'org_database', 'org_domain'], 'required'],
            [['org_domain'], 'url'],
            [['org_description', 'status'], 'string'],
            [['created_by', 'modified_by'], 'integer'],
            [['created_at', 'modified_at', 'deleted_at', 'status'], 'safe'],
            [['org_name'], 'string', 'max' => 100],
            [['org_db_host', 'org_db_username', 'org_db_password', 'org_database', 'org_domain'], 'string', 'max' => 255],
            [['org_name', 'org_database'], 'unique', 'on' => 'Create'],
            [['patient_UHID_prefix'],'required', 'on' => 'Create'],
            [['org_domain'], 'unique', 'on' => 'Create'],
            ['org_database', 'checkDB', 'on' => 'Create'],
            ['patient_UHID_prefix', 'validateCodeprefix', 'on' => 'Create'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'org_id' => 'Org ID',
            'org_name' => 'Organization Name',
            'org_description' => 'Organization Description',
            'org_db_host' => 'Host Name',
            'org_db_username' => 'Database Username',
            'org_db_password' => 'Database Password',
            'org_database' => 'Database Name',
            'org_domain' => 'Domain Name',
            'patient_UHID_prefix' => 'Patient UHID Prefix',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCoLogins() {
        return $this->hasMany(CoLogin::className(), ['org_id' => 'org_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getCoTenants() {
        return $this->hasMany(CoTenant::className(), ['org_id' => 'org_id'])->orderBy(['created_at' => SORT_ASC]);
    }

    public function getCoActiveTenants() {
        return $this->hasMany(CoTenant::className(), ['org_id' => 'org_id'])->andWhere(['status' => '1'])->orderBy(['created_at' => SORT_ASC]);
    }
    
    public function getGlInternalCodes() {
        return $this->hasOne(GlInternalCode::className(), ['org_id' => 'org_id']);
    }

    public function fields() {
        $extend = [
            'tenants' => function ($model) {
                return $model->coTenants;
            },
            'prefix_code' => function ($model) {
                return (isset($model->glInternalCodes->code_prefix) ? $model->glInternalCodes->code_prefix : '-');
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function checkDB($attribute, $params) {
        try {
            $connection = new Connection([
                'dsn' => "mysql:host={$this->org_db_host};dbname={$this->org_database}",
                'username' => $this->org_db_username,
                'password' => $this->org_db_password,
            ]);
            $connection->open();
            $connection->close();
        } catch (Exception $ex) {
            $this->addError($attribute, $ex->getMessage());
        }
    }
    
    public function validateCodeprefix($attribute, $params) {
        if($this->patient_UHID_prefix) {
            $InternalCode = GlInternalCode::find()->where(['code_prefix' => $this->patient_UHID_prefix])->one();
            if(!empty($InternalCode)) {
                $this->addError($attribute, "Patient UHID Prefix already taken. Kindly choose another Prefix");
            }
        }
    }

    public function beforeValidate() {
        $this->org_domain = rtrim($this->org_domain, "/");
        return parent::beforeValidate();
    }

    public function beforeSave($insert) {
        if ($this->is_decoded) {
            $this->org_db_host = base64_encode($this->org_db_host);
            $this->org_db_username = base64_encode($this->org_db_username);
            $this->org_db_password = base64_encode($this->org_db_password);
            $this->org_database = base64_encode($this->org_database);
        }
        
        return parent::beforeSave($insert);
    }

    public function afterFind() {
        $this->org_db_host = base64_decode($this->org_db_host);
        $this->org_db_username = base64_decode($this->org_db_username);
        $this->org_db_password = base64_decode($this->org_db_password);
        $this->org_database = base64_decode($this->org_database);

        $this->is_decoded = true;
        return parent::afterFind();
    }

    public function afterSave($insert, $changedAttributes) {
        $model = self::find()->where(['org_id' => $this->org_id])->one();
        $connection = new Connection([
            'dsn' => "mysql:host={$model->org_db_host};dbname={$model->org_database}",
            'username' => $model->org_db_username,
            'password' => $model->org_db_password,
        ]);
        $connection->open();

        if ($insert) {
             //Global Internal code.
            $internal_code = new GlInternalCode;
            $internal_code->org_id = $this->org_id;
            $internal_code->code_type = 'PG';
            $string = str_replace(' ', '-', $this->org_name);
            $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
            $internal_code->code_prefix = $this->patient_UHID_prefix;
            $internal_code->code = '1';
            $internal_code->save(false);
            
            $sql = "INSERT INTO co_organization VALUES({$this->org_id},'{$this->org_name}','{$this->org_description}','{$this->org_db_host}','{$this->org_db_username}','{$this->org_db_password}','{$this->org_database}','{$this->org_domain}','{$this->status}',{$this->created_by},'{$this->created_at}',{$this->modified_by},'{$this->modified_at}','{$this->deleted_at}')";
        } else {
            $sql = "UPDATE co_organization SET org_name = '{$this->org_name}', org_description = '{$this->org_description}', org_db_host = '{$this->org_db_host}', org_db_username = '{$this->org_db_username}', org_db_password = '{$this->org_db_password}', org_database = '{$this->org_database}', org_domain = '{$this->org_domain}', status = '{$this->status}', modified_by = '{$this->modified_by}', modified_at = '{$this->modified_at}', deleted_at = '{$this->deleted_at}' WHERE org_id={$this->org_id}";
        }
        $command = $connection->createCommand($sql);
        $command->execute();
        $connection->close();
        
        return parent::afterSave($insert, $changedAttributes);
    }


}
