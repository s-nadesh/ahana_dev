<?php

namespace common\models;

use common\models\query\PhaGstQuery;
use yii\db\ActiveQuery;
use Yii;
/**
 * This is the model class for table "pha_gst".
 *
 * @property integer $gst_id
 * @property integer $tenant_id
 * @property string $gst
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PhaGst extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_gst';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'gst'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['gst'], 'number'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
                [['gst'], 'unique', 'targetAttribute' => ['tenant_id', 'gst', 'deleted_at'], 'comboNotUnique' => 'The combination of Gst has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'gst_id' => 'Gst ID',
            'tenant_id' => 'Tenant ID',
            'gst' => 'Gst',
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
        return new PhaGstQuery(get_called_class());
    }
    
    public static function getGstList($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

}
