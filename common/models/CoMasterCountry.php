<?php

namespace common\models;

use common\models\query\CoCountryQuery;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "co_master_country".
 *
 * @property integer $country_id
 * @property integer $tenant_id
 * @property string $country_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoMasterState[] $coMasterStates
 */
class CoMasterCountry extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_master_country';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['country_name'], 'required'],
                [['status'], 'string'],
                [['created_by', 'modified_by', 'tenant_id'], 'integer'],
                [['created_at', 'modified_at', 'tenant_id'], 'safe'],
                [['country_name'], 'string', 'max' => 50],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'country_name', 'deleted_at'], 'message' => 'The combination has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'country_id' => 'Country ID',
            'tenant_id' => 'Org',
            'country_name' => 'Country Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCoMasterStates() {
        return $this->hasMany(CoMasterState::className(), ['country_id' => 'country_id']);
    }

    public static function getCountrylist() {
        return ArrayHelper::map(self::find()->all(), 'country_id', 'country_name');
    }

    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoCountryQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Country Added Successfully (#' . $this->country_name . ' )';
        else
            $activity = 'Country Updated Successfully (#' . $this->country_name . ' )';
        CoAuditLog::insertAuditLog(CoCountry::tableName(), $this->country_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
