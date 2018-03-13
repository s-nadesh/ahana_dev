<?php

namespace common\models;

use common\models\query\PhaGenericQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_generic".
 *
 * @property integer $generic_id
 * @property integer $tenant_id
 * @property string $generic_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class PhaGeneric extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_generic';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['generic_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['generic_name'], 'string', 'max' => 255],
                [['tenant_id', 'generic_name', 'deleted_at'], 'unique', 'targetAttribute' => ['tenant_id', 'generic_name', 'deleted_at'], 'message' => 'The combination of Tenant ID, Generic Name and Deleted At has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'generic_id' => 'Generic ID',
            'tenant_id' => 'Tenant ID',
            'generic_name' => 'Generic Name',
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
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaGenericQuery(get_called_class());
    }
    
    public function fields() {
        $extend = [];

        $parent_fields = parent::fields();
        $addt_keys = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'prescription_generic':
                    $parent_fields = [
                        'generic_id' => 'generic_id',
                        'generic_name' => 'generic_name',
                    ];
                    break;
            endswitch;
        }

        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public static function getGenericlist($tenant = null, $status = '1', $deleted = false, $notUsed = false) {
        if (!$deleted) {
            if ($notUsed)
                $list = self::find()->tenant($tenant)->status($status)->active()->notUsed()->all();
            else
                $list = self::find()->tenant($tenant)->status($status)->active()->all();
        } else {
            $list = self::find()->tenant($tenant)->deleted()->all();
        }

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Generic name Added Successfully (#' . $this->generic_name . ' )';
        else
            $activity = 'Generic name Updated Successfully (#' . $this->generic_name . ' )';
        CoAuditLog::insertAuditLog(PhaGeneric::tableName(), $this->generic_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
